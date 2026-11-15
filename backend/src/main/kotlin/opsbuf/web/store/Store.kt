package opsbuf.web.store

import kotlinx.serialization.json.Json
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

class Store(private val file: Path?) {
    private val lock = ReentrantLock()
    private var state: StoreState = loadState()

    fun <T> read(query: (StoreState) -> T): T = lock.withLock { query(state) }

    fun <T> update(change: (StoreState) -> Change<T>): T = lock.withLock {
        val change = change(state)
        if (change.state !== state) {
            state = change.state
            saveState(change.state)
        }
        change.value
    }

    data class Change<T>(val state: StoreState, val value: T)

    private fun loadState(): StoreState {
        if (file == null || !Files.exists(file)) return StoreState()
        return json.decodeFromString(StoreState.serializer(), Files.readString(file))
    }

    private fun saveState(next: StoreState) {
        if (file == null) return
        Files.createDirectories(file.toAbsolutePath().parent)
        val temporary = file.resolveSibling("${file.fileName}.tmp")
        Files.writeString(temporary, json.encodeToString(StoreState.serializer(), next))
        Files.move(temporary, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE)
    }

    private companion object {
        val json = Json {
            prettyPrint = true
            ignoreUnknownKeys = true
        }
    }
}

fun <T> StoreState.keep(value: T) = Store.Change(this, value)

fun <T> StoreState.save(value: T) = Store.Change(this, value)
