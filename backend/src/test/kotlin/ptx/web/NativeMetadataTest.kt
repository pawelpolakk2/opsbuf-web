package ptx.web

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import ptx.web.store.StoreState
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.extension
import kotlin.io.path.invariantSeparatorsPathString
import kotlin.io.path.relativeTo
import kotlin.io.path.toPath
import kotlin.test.Test
import kotlin.test.assertEquals

class NativeMetadataTest {
    @Test
    fun `should register every serializable class for the native image`() {
        val missing = findSerializableClassNames() - findRegisteredTypes()

        assertEquals(emptySet(), missing, "Add these classes to reachability-metadata.json")
    }

    private fun findSerializableClassNames(): Set<String> {
        val classesRoot = StoreState::class.java.protectionDomain.codeSource.location.toURI().toPath()
        return Files.walk(classesRoot).use { paths ->
            paths.filter { it.extension == "class" }
                .map { toClassName(classesRoot, it) }
                .filter { Class.forName(it, false, javaClass.classLoader).isAnnotationPresent(Serializable::class.java) }
                .toList()
                .toSet()
        }
    }

    private fun toClassName(root: Path, file: Path): String =
        file.relativeTo(root).invariantSeparatorsPathString.removeSuffix(".class").replace('/', '.')

    private fun findRegisteredTypes(): Set<String> {
        val text = requireNotNull(javaClass.getResource(METADATA)) { "Missing $METADATA" }.readText()
        return Json.parseToJsonElement(text).jsonObject.getValue("reflection").jsonArray
            .map { it.jsonObject.getValue("type").jsonPrimitive.content }
            .toSet()
    }

    private companion object {
        const val METADATA = "/META-INF/native-image/ptx.web/ptx-web/reachability-metadata.json"
    }
}
