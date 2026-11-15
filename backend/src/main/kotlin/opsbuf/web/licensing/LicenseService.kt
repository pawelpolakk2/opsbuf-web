package opsbuf.web.licensing

import opsbuf.web.Secrets
import opsbuf.web.store.Activation
import opsbuf.web.store.Billing
import opsbuf.web.store.License
import opsbuf.web.store.LicenseStatus
import opsbuf.web.store.Order
import opsbuf.web.store.Store
import opsbuf.web.store.StoreState
import opsbuf.web.store.User
import opsbuf.web.store.keep
import opsbuf.web.store.save
import java.time.Clock
import java.time.ZoneOffset

enum class Refusal { NOT_FOUND, FORBIDDEN, CONFLICT, INVALID }

sealed interface LicenseOutcome {
    data class Done(val license: License) : LicenseOutcome
    data class Refused(val reason: Refusal, val message: String) : LicenseOutcome
}

data class PurchaseRequest(val planId: String, val seats: Int, val billing: Billing)

class LicenseService(
    private val store: Store,
    private val payments: PaymentGateway,
    private val clock: Clock,
) {
    fun listLicensesOf(user: User): List<License> = store.read { state ->
        state.licenses.filter { it.ownerId == user.id || user.email in it.members }.sortedByDescending { it.createdAt }
    }

    fun listOrdersOf(user: User): List<Order> = store.read { state ->
        state.orders.filter { it.userId == user.id }.sortedByDescending { it.paidAt }
    }

    suspend fun purchase(user: User, request: PurchaseRequest): LicenseOutcome {
        val plan = Plans.findById(request.planId) ?: return refuse(Refusal.INVALID, "There is no plan '${request.planId}'.")
        if (request.seats !in plan.minSeats..plan.maxSeats) {
            return refuse(Refusal.INVALID, "The ${plan.name} plan takes ${plan.minSeats} to ${plan.maxSeats} seats.")
        }
        val amountCents = plan.calculatePriceCents(request.billing, request.seats)
        val charge = Charge(user.email, amountCents, plan.currency, "opsbuf ${plan.name} × ${request.seats}")
        return when (val payment = payments.charge(charge)) {
            is Payment.Declined -> refuse(Refusal.CONFLICT, "The payment was declined: ${payment.reason}")
            is Payment.Paid -> LicenseOutcome.Done(storePurchase(user, plan, request, amountCents, payment.reference))
        }
    }

    fun addMember(owner: User, licenseId: String, rawEmail: String): LicenseOutcome {
        val email = rawEmail.trim().lowercase()
        if (!email.contains('@')) return refuse(Refusal.INVALID, "'$rawEmail' is not an email address.")
        return changeOwnedLicense(owner, licenseId) { license ->
            when {
                email in license.members -> refuse(Refusal.CONFLICT, "$email already has a seat.")
                license.members.size >= license.seats -> refuse(Refusal.CONFLICT, "All ${license.seats} seats are taken.")
                else -> LicenseOutcome.Done(license.copy(members = license.members + email))
            }
        }
    }

    fun removeMember(owner: User, licenseId: String, email: String): LicenseOutcome =
        changeOwnedLicense(owner, licenseId) { license ->
            if (email !in license.members) refuse(Refusal.NOT_FOUND, "$email has no seat on this license.")
            else LicenseOutcome.Done(license.copy(members = license.members - email))
        }

    fun deactivate(owner: User, licenseId: String, machineId: String): LicenseOutcome =
        changeOwnedLicense(owner, licenseId) { license ->
            val activations = license.activations.filterNot { it.machineId == machineId }
            if (activations.size == license.activations.size) refuse(Refusal.NOT_FOUND, "This machine is not activated.")
            else LicenseOutcome.Done(license.copy(activations = activations))
        }

    fun cancelRenewal(owner: User, licenseId: String): LicenseOutcome =
        changeOwnedLicense(owner, licenseId) { license ->
            LicenseOutcome.Done(license.copy(status = LicenseStatus.CANCELLED))
        }

    fun resumeRenewal(owner: User, licenseId: String): LicenseOutcome =
        changeOwnedLicense(owner, licenseId) { license ->
            LicenseOutcome.Done(license.copy(status = LicenseStatus.ACTIVE))
        }

    fun activate(key: String, machineId: String, machineName: String): LicenseOutcome {
        val now = clock.millis()
        return store.update { state ->
            val license = state.licenses.find { it.key == key.trim().uppercase() }
                ?: return@update state.keep(refuse(Refusal.NOT_FOUND, "This license key does not exist."))
            if (license.renewsAt <= now) return@update state.keep(refuse(Refusal.FORBIDDEN, "This license has expired."))
            val activated = activateMachine(license, machineId, machineName, now)
                ?: return@update state.keep(refuse(Refusal.CONFLICT, "All ${calculateDeviceLimit(license)} machines are activated."))
            state.replaceLicense(activated).save(LicenseOutcome.Done(activated))
        }
    }

    fun calculateDeviceLimit(license: License): Int =
        license.seats * (Plans.findById(license.planId)?.devicesPerSeat ?: 1)

    private fun activateMachine(license: License, machineId: String, machineName: String, now: Long): License? {
        val existing = license.activations.find { it.machineId == machineId }
        if (existing != null) {
            val refreshed = existing.copy(machineName = machineName, lastSeenAt = now)
            return license.copy(activations = license.activations.map { if (it == existing) refreshed else it })
        }
        if (license.activations.size >= calculateDeviceLimit(license)) return null
        return license.copy(activations = license.activations + Activation(machineId, machineName, now, now))
    }

    private fun storePurchase(user: User, plan: Plan, request: PurchaseRequest, amountCents: Long, reference: String): License {
        val now = clock.millis()
        val license = License(
            id = Secrets.createId("lic"),
            key = Secrets.createLicenseKey(),
            planId = plan.id,
            ownerId = user.id,
            seats = request.seats,
            billing = request.billing,
            members = listOf(user.email),
            activations = emptyList(),
            status = LicenseStatus.ACTIVE,
            createdAt = now,
            renewsAt = calculateRenewal(now, request.billing),
        )
        val order = Order(
            id = Secrets.createId("ord"),
            userId = user.id,
            licenseId = license.id,
            planId = plan.id,
            seats = request.seats,
            billing = request.billing,
            amountCents = amountCents,
            currency = plan.currency,
            paymentReference = reference,
            paidAt = now,
        )
        return store.update { state ->
            state.copy(licenses = state.licenses + license, orders = state.orders + order).save(license)
        }
    }

    private fun changeOwnedLicense(owner: User, licenseId: String, change: (License) -> LicenseOutcome): LicenseOutcome =
        store.update { state ->
            val license = state.licenses.find { it.id == licenseId }
            when {
                license == null -> state.keep(refuse(Refusal.NOT_FOUND, "There is no such license."))
                license.ownerId != owner.id -> state.keep(refuse(Refusal.FORBIDDEN, "Only the owner can change this license."))
                else -> saveOutcome(state, change(license))
            }
        }

    private fun saveOutcome(state: StoreState, outcome: LicenseOutcome): Store.Change<LicenseOutcome> = when (outcome) {
        is LicenseOutcome.Done -> state.replaceLicense(outcome.license).save(outcome)
        is LicenseOutcome.Refused -> state.keep(outcome)
    }

    private fun calculateRenewal(now: Long, billing: Billing): Long {
        val start = java.time.Instant.ofEpochMilli(now).atZone(ZoneOffset.UTC)
        val end = if (billing == Billing.YEARLY) start.plusYears(1) else start.plusMonths(1)
        return end.toInstant().toEpochMilli()
    }

    private fun refuse(reason: Refusal, message: String) = LicenseOutcome.Refused(reason, message)

    private fun StoreState.replaceLicense(license: License) =
        copy(licenses = licenses.map { if (it.id == license.id) license else it })
}
