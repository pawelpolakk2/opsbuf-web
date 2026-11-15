package ptx.web.http

import kotlinx.serialization.Serializable
import ptx.web.licensing.Plans
import ptx.web.store.Activation
import ptx.web.store.Billing
import ptx.web.store.License
import ptx.web.store.LicenseStatus
import ptx.web.store.User

@Serializable
data class EmailBody(val email: String)

@Serializable
data class VerifyBody(val email: String, val code: String)

@Serializable
data class CodeSentResponse(val devCode: String? = null)

@Serializable
data class UserView(val id: String, val email: String)

@Serializable
data class SessionResponse(val token: String, val user: UserView)

@Serializable
data class ErrorResponse(val error: String, val retryInSeconds: Long? = null, val attemptsLeft: Int? = null)

@Serializable
data class PurchaseBody(val planId: String, val seats: Int, val billing: Billing)

@Serializable
data class MemberBody(val email: String)

@Serializable
data class ActivateBody(val key: String, val machineId: String, val machineName: String)

@Serializable
data class LicenseView(
    val id: String,
    val key: String,
    val planId: String,
    val planName: String,
    val seats: Int,
    val billing: Billing,
    val members: List<String>,
    val activations: List<Activation>,
    val deviceLimit: Int,
    val status: LicenseStatus,
    val isOwner: Boolean,
    val createdAt: Long,
    val renewsAt: Long,
)

@Serializable
data class ActivationResponse(
    val planName: String,
    val seats: Int,
    val validUntil: Long,
    val renews: Boolean,
)

fun User.toView() = UserView(id, email)

fun License.toView(viewer: User, deviceLimit: Int) = LicenseView(
    id = id,
    key = key,
    planId = planId,
    planName = Plans.findById(planId)?.name ?: planId,
    seats = seats,
    billing = billing,
    members = members,
    activations = activations.sortedByDescending { it.lastSeenAt },
    deviceLimit = deviceLimit,
    status = status,
    isOwner = ownerId == viewer.id,
    createdAt = createdAt,
    renewsAt = renewsAt,
)

fun License.toActivationResponse() = ActivationResponse(
    planName = Plans.findById(planId)?.name ?: planId,
    seats = seats,
    validUntil = renewsAt,
    renews = status == LicenseStatus.ACTIVE,
)
