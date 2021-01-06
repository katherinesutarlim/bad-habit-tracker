# Bad Habit Tracker #

This is a mobile application to help keep count and track of bad habits. This is based on the idea of keeping track of when you are aware of the habit occurring and whether you continue after you become aware of it.

This application is designed and developed primarily for Android. It is not tested on iOS

## Requirements ##

* Node.js version 10

## Installation ##

1. Clone the repository
1. run `npm install` or `yarn install` to install package dependencies
1. Open a simulator (using XCode for iOS or Android Studio for Android) or connect your phone (Android)
1. Run `react-native run-android` or `react-native run-ios` to build and run the app on the Android and iOS device/simulator respectively.

## Usage ##

There are 3 pages in the app:

### Counter Page ###

In this page, click one of the options to increase the count of the option.

### History Page ###

This page displays the count details for each day. Select which date you want to see the count for using the calendar. The count displayed will change to reflect the date. Scroll down to see each logged count. Tap and hold the log to delete it. You can also scroll up past the top to refresh the data.

### Stats Page ###

This page displays a heatmap for the count. Choose the date range with the picker and select which data you want to be displayed. If the heatmap is not updated, refresh the page by scrolling up past the top.
