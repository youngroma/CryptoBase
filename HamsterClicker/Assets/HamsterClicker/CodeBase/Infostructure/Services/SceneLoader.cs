using System;
using Cysharp.Threading.Tasks;
using UnityEngine.SceneManagement;

namespace HamsterClicker.CodeBase.Infostructure.Services
{
    public class SceneLoader 
    {
        public UniTask LoadSceneAsync(int sceneIndex, Action onComplete = null)
        {
            if (sceneIndex != SceneManager.GetActiveScene().buildIndex)
            {
                UniTask asyncOperation = SceneManager.LoadSceneAsync(sceneIndex).ToUniTask();

                asyncOperation.ContinueWith(() =>
                {
                    onComplete?.Invoke();
                });
                
                return asyncOperation;
            }

            return UniTask.CompletedTask;
        }
    }
}