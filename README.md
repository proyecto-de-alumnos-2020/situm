# Situm Cordova Getting Started

NOTE: This app is only a use-case for testing purposes. It may not be up to date or optimized.

- [Usage](#usage)
- [Run Android version](#run-android-version)
- [Run iOS version](#run-ios-version)

## Requirements

1. (Ionic)[https://ionicframework.com/docs/intro/cli]
2. (Android Studio)[https://ionicframework.com/docs/developing/android]

## Usage

1. Ionic installation : https://ionicframework.com/docs/intro/installation/

2. Initialize project:

```
npm install
ionic cordova prepare android
```

3. Link development plugin folder:

```
  $ cd situm-cordova-getting-started
  $ cordova plugin add --link <path_to_plugin_folder>/situm-cordova-plugin/
```

Before launching the application it is necessary to cover the credentials in the `src/services/situm.ts` file.

So, `config.xml` file should contain one line like this:

    <plugin name="situm-cordova-plugin" spec="file:../situm-cordova-plugin" />

## Firebase Configuration

Firebase configuration file can be found it `src/firebaseConfig.ts`. In order to define a new firebase project you should go to https://console.firebase.google.com/ and:

- Create a new project.

- Register a web project.

- Copy the given credentials to `src/firebaseConfig.ts`.

## Run Android version

- **Run from command line**: `$ ionic cordova run android -l --ssl`

- **Run from Android Studio**: Go to plaftforms/android folder. Create android studio project and run `MainActivity` class

## Run iOS version

- **Run from command line**: `$ ionic cordova run ios`

- **Run from Xcode**: Go to platforms/ios folder and open `Situm Cordova Getting Started.xcworkspace`
