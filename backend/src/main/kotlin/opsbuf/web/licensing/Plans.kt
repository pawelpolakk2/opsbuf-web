package opsbuf.web.licensing

import kotlinx.serialization.Serializable
import opsbuf.web.store.Billing

@Serializable
data class Plan(
    val id: String,
    val name: String,
    val tagline: String,
    val monthlyCents: Long,
    val yearlyCents: Long,
    val currency: String,
    val minSeats: Int,
    val maxSeats: Int,
    val devicesPerSeat: Int,
    val features: List<String>,
) {
    fun calculatePriceCents(billing: Billing, seats: Int): Long =
        seats * if (billing == Billing.YEARLY) yearlyCents else monthlyCents
}

object Plans {
    val all = listOf(
        Plan(
            id = "personal",
            name = "Personal",
            tagline = "For one developer and their machines.",
            monthlyCents = 1200,
            yearlyCents = 12000,
            currency = "EUR",
            minSeats = 1,
            maxSeats = 1,
            devicesPerSeat = 2,
            features = listOf(
                "All modules: Logs, Scripts, Kubernetes, Redis, Data, HTTP, Git, Prompts, Access, Builds",
                "The opsbuf CLI and the Chrome capture plugin",
                "2 activated machines",
                "Every update while the license runs",
            ),
        ),
        Plan(
            id = "team",
            name = "Team",
            tagline = "Shared projects in git, one bill for the team.",
            monthlyCents = 1900,
            yearlyCents = 19000,
            currency = "EUR",
            minSeats = 2,
            maxSeats = 250,
            devicesPerSeat = 3,
            features = listOf(
                "Everything in Personal",
                "Seats you assign by email",
                "3 activated machines per seat",
                "Invoices and seat management in one place",
                "Priority support",
            ),
        ),
    )

    fun findById(id: String): Plan? = all.find { it.id == id }
}
