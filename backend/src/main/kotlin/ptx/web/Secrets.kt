package ptx.web

import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64

object Secrets {
    private val random = SecureRandom()
    private const val KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    fun createToken(): String {
        val bytes = ByteArray(32).also(random::nextBytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    fun createId(prefix: String): String {
        val bytes = ByteArray(9).also(random::nextBytes)
        return prefix + "_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    fun createLoginCode(): String = (0 until 6).map { random.nextInt(10) }.joinToString("")

    fun createLicenseKey(): String =
        (0 until 4).joinToString("-", prefix = "PTX-") {
            (0 until 5).map { KEY_ALPHABET[random.nextInt(KEY_ALPHABET.length)] }.joinToString("")
        }

    fun hash(value: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(value.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }
    }

    fun isEqual(left: String, right: String): Boolean =
        MessageDigest.isEqual(left.toByteArray(), right.toByteArray())
}
