using System.Collections;
using UnityEditor;
using UnityEngine;
using Zenject;

namespace HamsterClicker.CodeBase.Infostructure.Services.DataSaving.AutoSaving
{
    public class AutoSaveController : MonoBehaviour
    {
        public static AutoSaveController Instance { get; private set; }

        private ProgressDataHandler _progressDataHandler;
        private float _saveInterval = 30f;
        private Coroutine _autoSaveCoroutine;

        [Inject]
        public void Construct(ProgressDataHandler progressDataHandler)
        {
            _progressDataHandler = progressDataHandler;
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

#if UNITY_EDITOR
            EditorApplication.playModeStateChanged += OnPlayModeStateChanged;
#endif

            Application.quitting += OnApplicationQuit;
            _autoSaveCoroutine = StartCoroutine(AutoSaveLoop());
        }

        private void OnDestroy()
        {
#if UNITY_EDITOR
            EditorApplication.playModeStateChanged -= OnPlayModeStateChanged;
#endif
            Application.quitting -= OnApplicationQuit;

            if (_autoSaveCoroutine != null)
                StopCoroutine(_autoSaveCoroutine);
        }

#if UNITY_EDITOR
        private void OnPlayModeStateChanged(PlayModeStateChange state)
        {
            if (state == PlayModeStateChange.ExitingPlayMode)
            {
                SaveNow("[Editor] Exiting Play Mode");
            }
        }
#endif

        private void OnApplicationQuit()
        {
            SaveNow("Quitting Application");
        }

        private void SaveNow(string reason)
        {
            if (_progressDataHandler == null)
            {
                Debug.LogWarning($"[AutoSaveController] No ProgressDataHandler assigned during {reason}.");
                return;
            }

            Debug.Log($"[AutoSaveController] Saving progress: {reason}");
            _progressDataHandler.SaveAll();
        }

        public void SaveNow()
        {
            SaveNow("Manual Save");
        }

        private IEnumerator AutoSaveLoop()
        {
            while (true)
            {
                yield return new WaitForSeconds(_saveInterval);
                SaveNow("Interval Auto-Save");
            }
        }
    }
}