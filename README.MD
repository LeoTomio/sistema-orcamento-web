# App

- Capacitor: Converte o codigo react para mobile

# Instruções

- Gerar buid
- Adicionar npm install @capacitor/core @capacitor/cli
- npx cap init
- App name -> nome do app
- App Package Id -> id do app 

- yarn add @capacitor/android - adicionar o capacitor/android
- npx cap add android - adicionar no capacitor
- npx cap sync android - sincroniza com a build ( Sempre que fizer build nova tem que rodar novamente)
- npx cap open android -> vai abrir no android studio

### Android Studio
## Configs 

# variable.gradle :
ext {
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.2'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.8.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}

# android/build.gradle:
 dependencies {
        classpath 'com.android.tools.build:gradle:8.5.1'
 }

# gradle-wrapper.properties:
    distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-all.zip

# capacitor.build.gradle:
 compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

## Gerar APK para usar sem Play Store
- Menu build -> Build Bundle(s) / APK(s) -> Build APK(s)
- APK é gerado e fica algo como: android/app/build/outputs/apk/debug/app-debug.apk
esse apk ja funciona no celular

## Gerar AAB para subir na Play Store
- Menu build -> Generate Signed Bundle / APK -> escolhe Android App Bundle 
- Criar a keystore, assina e sobe na Play Store.


# Obs

Sempre que alterar o front:

npm run build
npx cap sync android
npx cap open android

Sempre tem que alterar a versao do java de 21 pra 17 no capacitor.build.gradle
