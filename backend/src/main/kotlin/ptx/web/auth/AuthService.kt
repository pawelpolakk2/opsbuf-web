package ptx.web.auth

import ptx.web.AppConfig
import ptx.web.Secrets
import ptx.web.mail.MailMessage
import ptx.web.mail.Mailer
import ptx.web.store.LoginCode
import ptx.web.store.Session
import ptx.web.store.Store
import ptx.web.store.StoreState
import ptx.web.store.User
import ptx.web.store.keep
import ptx.web.store.save
import java.time.Clock

sealed interface CodeRequest {
    data class Sent(val devCode: String?) : CodeRequest
    data class TooSoon(val retryInSeconds: Long) : CodeRequest
    data object InvalidEmail : CodeRequest
}

sealed interface Verification {
    data class Verified(val token: String, val user: User) : Verification
    data class WrongCode(val attemptsLeft: Int) : Verification
    data object NoValidCode : Verification
}

class AuthService(
    private val store: Store,
    private val mailer: Mailer,
    private val clock: Clock,
    private val config: AppConfig,
) {
    suspend fun requestCode(rawEmail: String): CodeRequest {
        val email = normalizeEmail(rawEmail)
        if (!isValidEmail(email)) return CodeRequest.InvalidEmail
        val code = Secrets.createLoginCode()
        val tooSoon = storeCodeUnlessTooSoon(email, code)
        if (tooSoon != null) return tooSoon
        mailer.send(createCodeMessage(email, code))
        return CodeRequest.Sent(code.takeIf { config.showDevCodes })
    }

    fun verifyCode(rawEmail: String, code: String): Verification {
        val email = normalizeEmail(rawEmail)
        val now = clock.millis()
        return store.update { state ->
            val pending = state.codes.find { it.email == email && it.expiresAt > now && it.attemptsLeft > 0 }
            when {
                pending == null -> state.keep(Verification.NoValidCode)
                !Secrets.isEqual(pending.codeHash, Secrets.hash(code.trim())) -> rejectAttempt(state, pending)
                else -> startSession(state, email, now)
            }
        }
    }

    fun findUserByToken(token: String): User? {
        val tokenHash = Secrets.hash(token)
        val now = clock.millis()
        return store.read { state ->
            state.sessions.find { it.tokenHash == tokenHash && it.expiresAt > now }
                ?.let { session -> state.users.find { it.id == session.userId } }
        }
    }

    fun logout(token: String) {
        val tokenHash = Secrets.hash(token)
        store.update { state -> state.copy(sessions = state.sessions.filterNot { it.tokenHash == tokenHash }).save(Unit) }
    }

    private fun storeCodeUnlessTooSoon(email: String, code: String): CodeRequest.TooSoon? {
        val now = clock.millis()
        return store.update { state ->
            val previous = state.codes.find { it.email == email }
            val waitMillis = previous?.let { it.sentAt + config.codeResendAfter.inWholeMilliseconds - now } ?: 0
            if (waitMillis > 0) return@update state.keep(CodeRequest.TooSoon((waitMillis + 999) / 1000))
            val loginCode = LoginCode(
                email = email,
                codeHash = Secrets.hash(code),
                sentAt = now,
                expiresAt = now + config.codeTtl.inWholeMilliseconds,
                attemptsLeft = config.codeAttempts,
            )
            val codes = state.codes.filterNot { it.email == email || it.expiresAt <= now } + loginCode
            state.copy(codes = codes).save(null)
        }
    }

    private fun rejectAttempt(state: StoreState, pending: LoginCode): Store.Change<Verification> {
        val attemptsLeft = pending.attemptsLeft - 1
        val codes = state.codes.map { if (it == pending) it.copy(attemptsLeft = attemptsLeft) else it }
        return state.copy(codes = codes).save(Verification.WrongCode(attemptsLeft))
    }

    private fun startSession(state: StoreState, email: String, now: Long): Store.Change<Verification> {
        val user = state.users.find { it.email == email } ?: User(Secrets.createId("usr"), email, now)
        val token = Secrets.createToken()
        val session = Session(Secrets.hash(token), user.id, now + config.sessionTtl.inWholeMilliseconds)
        val next = state.copy(
            users = if (state.users.contains(user)) state.users else state.users + user,
            codes = state.codes.filterNot { it.email == email },
            sessions = state.sessions.filter { it.expiresAt > now } + session,
        )
        return next.save(Verification.Verified(token, user))
    }

    private fun createCodeMessage(email: String, code: String) = MailMessage(
        to = email,
        subject = "Your PTX sign-in code: $code",
        text = """
            |Your PTX sign-in code is $code
            |
            |It is valid for ${config.codeTtl.inWholeMinutes} minutes. If you did not ask for it, ignore this email.
        """.trimMargin(),
    )

    private fun normalizeEmail(email: String) = email.trim().lowercase()

    private fun isValidEmail(email: String) = email.length <= 254 && EMAIL.matches(email)

    private companion object {
        val EMAIL = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    }
}
