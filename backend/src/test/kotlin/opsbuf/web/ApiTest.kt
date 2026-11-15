package opsbuf.web

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import opsbuf.web.http.ActivateBody
import opsbuf.web.http.CodeSentResponse
import opsbuf.web.http.EmailBody
import opsbuf.web.http.ErrorResponse
import opsbuf.web.http.LicenseView
import opsbuf.web.http.MemberBody
import opsbuf.web.http.PurchaseBody
import opsbuf.web.http.SessionResponse
import opsbuf.web.http.VerifyBody
import opsbuf.web.store.Billing
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ApiTest {
    private val config = AppConfig(dataFile = null, showDevCodes = true)

    @Test
    fun `signs in with the code sent by email`() = testOpsbuf { client ->
        val token = signIn(client, "Dev@Example.com")

        val me = client.get("/api/auth/me") { bearerAuth(token) }

        assertEquals(HttpStatusCode.OK, me.status)
        assertTrue(me.body<String>().contains("dev@example.com"))
    }

    @Test
    fun `refuses a wrong code and counts the attempts`() = testOpsbuf { client ->
        client.postJson("/api/auth/code", EmailBody("dev@example.com"))

        val response = client.postJson("/api/auth/verify", VerifyBody("dev@example.com", "000000x"))

        assertEquals(HttpStatusCode.Unauthorized, response.status)
        assertEquals(4, response.body<ErrorResponse>().attemptsLeft)
    }

    @Test
    fun `asks to wait before a second code`() = testOpsbuf { client ->
        client.postJson("/api/auth/code", EmailBody("dev@example.com"))

        val response = client.postJson("/api/auth/code", EmailBody("dev@example.com"))

        assertEquals(HttpStatusCode.TooManyRequests, response.status)
    }

    @Test
    fun `buys a team license, assigns seats and activates machines`() = testOpsbuf { client ->
        val token = signIn(client, "lead@example.com")
        val license = client.postJson("/api/licenses", PurchaseBody("team", 2, Billing.YEARLY), token).body<LicenseView>()

        val withMember = client.postJson("/api/licenses/${license.id}/members", MemberBody("dev@example.com"), token)
        val full = client.postJson("/api/licenses/${license.id}/members", MemberBody("third@example.com"), token)
        val activation = client.postJson("/api/activations", ActivateBody(license.key, "mac-1", "MacBook Pro"))

        assertEquals(listOf("lead@example.com", "dev@example.com"), withMember.body<LicenseView>().members)
        assertEquals(HttpStatusCode.Conflict, full.status)
        assertEquals(HttpStatusCode.OK, activation.status)
        assertEquals(6, license.deviceLimit)
    }

    @Test
    fun `lets a member see the license but not change it`() = testOpsbuf { client ->
        val ownerToken = signIn(client, "lead@example.com")
        val license = client.postJson("/api/licenses", PurchaseBody("team", 3, Billing.MONTHLY), ownerToken).body<LicenseView>()
        client.postJson("/api/licenses/${license.id}/members", MemberBody("dev@example.com"), ownerToken)
        val memberToken = signIn(client, "dev@example.com")

        val visible = client.get("/api/licenses") { bearerAuth(memberToken) }.body<List<LicenseView>>()
        val removal = client.delete("/api/licenses/${license.id}/members/lead@example.com") { bearerAuth(memberToken) }

        assertEquals(listOf(false), visible.map { it.isOwner })
        assertEquals(HttpStatusCode.Forbidden, removal.status)
    }

    @Test
    fun `refuses an unknown license key`() = testOpsbuf { client ->
        val response = client.postJson("/api/activations", ActivateBody("OPSBUF-NOPE", "mac-1", "Mac"))

        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    private fun testOpsbuf(test: suspend ApplicationTestBuilder.(HttpClient) -> Unit) = testApplication {
        application { opsbufModule(createDi(config)) }
        val client = createClient { install(ContentNegotiation) { json() } }
        test(client)
    }

    private suspend fun signIn(client: HttpClient, email: String): String {
        val code = client.postJson("/api/auth/code", EmailBody(email)).body<CodeSentResponse>().devCode!!
        return client.postJson("/api/auth/verify", VerifyBody(email, code)).body<SessionResponse>().token
    }

    private suspend inline fun <reified T> HttpClient.postJson(path: String, body: T, token: String? = null) = post(path) {
        contentType(ContentType.Application.Json)
        token?.let { bearerAuth(it) }
        setBody(body)
    }
}
