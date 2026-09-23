# Radio Ebenezer Online - Android APK

Wrapper WebView que carga la app web desde Netlify.

## Requisitos

- Android Studio o Android SDK (API 34)
- Java 8+

## Build APK

### Opción 1: Android Studio

1. Abrir `android/` en Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 2: Línea de comandos

```cmd
cd android
gradlew.bat assembleDebug
```

El APK se genera en `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 3: Release (firmado)

```cmd
cd android
gradlew.bat assembleRelease
```

Para firmar, crear `android/key.properties` y configurar signing en `app/build.gradle`.

## Cómo funciona

- WebView carga `https://radio-ebenezer-online.netlify.app/`
- JavaScript y DOM Storage habilitados
- Cada actualización de Netlify se refleja automáticamente en la app
- Pantalla completa sin barra de título
- Botón atrás navega hacia atrás en el WebView
- Share Bridge para Web Share API (navigator.share)

## Personalización

- URL: cambiar en `MainActivity.java` → `private static final String URL`
- Nombre: cambiar en `AndroidManifest.xml` → `android:label`
- Icono: reemplazar `res/mipmap-*/ic_launcher.png`

## Google Play

Para publicar en Google Play:
1. Generar keystore de release: `keytool -genkey -v -keystore ebenezer-radio-release.keystore -alias ebenezer -keyalg RSA -keysize 2048 -validity 10000`
2. Configurar signing en `app/build.gradle` (ya incluido)
3. `gradlew.bat bundleRelease` genera AAB en `app/build/outputs/bundle/release/app-release.aab`
4. Subir AAB a Google Play Console