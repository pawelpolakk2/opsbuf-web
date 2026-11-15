package ptx.web.store

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val createdAt: Long,
)

@Serializable
data class LoginCode(
    val email: String,
    val codeHash: String,
    val sentAt: Long,
    val expiresAt: Long,
    val attemptsLeft: Int,
)

@Serializable
data class Session(
    val tokenHash: String,
    val userId: String,
    val expiresAt: Long,
)

@Serializable
enum class Billing { MONTHLY, YEARLY }

@Serializable
enum class LicenseStatus { ACTIVE, CANCELLED }

@Serializable
data class Activation(
    val machineId: String,
    val machineName: String,
    val activatedAt: Long,
    val lastSeenAt: Long,
)

@Serializable
data class License(
    val id: String,
    val key: String,
    val planId: String,
    val ownerId: String,
    val seats: Int,
    val billing: Billing,
    val members: List<String>,
    val activations: List<Activation>,
    val status: LicenseStatus,
    val createdAt: Long,
    val renewsAt: Long,
)

@Serializable
data class Order(
    val id: String,
    val userId: String,
    val licenseId: String,
    val planId: String,
    val seats: Int,
    val billing: Billing,
    val amountCents: Long,
    val currency: String,
    val paymentReference: String,
    val paidAt: Long,
)

@Serializable
data class StoreState(
    val users: List<User> = emptyList(),
    val codes: List<LoginCode> = emptyList(),
    val sessions: List<Session> = emptyList(),
    val licenses: List<License> = emptyList(),
    val orders: List<Order> = emptyList(),
)
