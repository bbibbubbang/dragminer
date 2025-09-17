# dragminer

## Repository structure

```
android/
  app/src/main/java/com/example/dragminer/MainActivity.kt
  snippets/
    build_gradle_snippet.gradle
    manifest_snippet.xml
web/
  index.html
  pgs_integration.js
  snippets/
    settings_snippet.html
```

Android specific source lives under `android/`, while web assets that power the
GitHub Pages build are inside `web/`. Snippet files are grouped together with
the platform they belong to for easier discovery.
