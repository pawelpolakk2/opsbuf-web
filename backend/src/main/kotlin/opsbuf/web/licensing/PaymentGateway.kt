package opsbuf.web.licensing

import opsbuf.web.Secrets

data class Charge(val email: String, val amountCents: Long, val currency: String, val description: String)

sealed interface Payment {
    data class Paid(val reference: String) : Payment
    data class Declined(val reason: String) : Payment
}

interface PaymentGateway {
    suspend fun charge(charge: Charge): Payment
}

class DemoPaymentGateway : PaymentGateway {
    override suspend fun charge(charge: Charge): Payment = Payment.Paid(Secrets.createId("demo"))
}
