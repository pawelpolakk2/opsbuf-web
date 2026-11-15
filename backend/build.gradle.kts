plugins {
    kotlin("jvm") version "2.4.21"
    kotlin("plugin.serialization") version "2.4.21"
    application
    id("org.graalvm.buildtools.native") version "1.1.18"
}

group = "ptx.web"
version = "0.1.0"

repositories {
    mavenCentral()
}

val ktorVersion = "3.6.1"

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-cio:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-client-core:$ktorVersion")
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("org.kodein.di:kodein-di:7.33.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.12.0")
    implementation("org.slf4j:slf4j-simple:2.0.20")

    testImplementation(kotlin("test"))
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
}

kotlin {
    jvmToolchain(21)
}

application {
    mainClass.set("ptx.web.MainKt")
}

tasks.test {
    useJUnitPlatform()
}

graalvmNative {
    toolchainDetection.set(false)
    binaries {
        named("main") {
            imageName.set("ptx-web")
            mainClass.set("ptx.web.MainKt")
            buildArgs.addAll(
                "--initialize-at-build-time=io.ktor,kotlin,kotlinx.coroutines,kotlinx.serialization,kotlinx.io,org.slf4j",
                "--initialize-at-run-time=io.ktor.util.NonceKt",
                "--enable-url-protocols=https",
                "-H:+InstallExitHandlers",
                "-H:+ReportExceptionStackTraces",
                "--no-fallback",
                "-EDEVELOPER_DIR",
            )
        }
    }
}
