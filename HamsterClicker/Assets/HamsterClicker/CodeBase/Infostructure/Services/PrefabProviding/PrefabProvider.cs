using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace HamsterClicker.CodeBase.Infostructure.Services.PrefabProviding
{
    public static class PrefabProvider
    {
        public static T LoadPrefab<T>(string addressableName) where T : MonoBehaviour
        {
            var handle =  Addressables.LoadAssetAsync<T>(addressableName);
            
            handle.WaitForCompletion();
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {addressableName}");
                return null;
            }
        }

        public static T LoadAsset<T>(string addressableName) where T : class
        {
            var handle = Addressables.LoadAssetAsync<T>(addressableName);
            handle.WaitForCompletion();
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load asset at {addressableName}");
                return null;
            }
        }
        
        
        public static GameObject LoadPrefab(string addressableName)
        {
            var handle =  Addressables.LoadAssetAsync<GameObject>(addressableName);
            
            handle.WaitForCompletion();
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {addressableName}");
                return null;
            }
        }
        public static T LoadPrefab<T>(AssetReference reference) where T : MonoBehaviour
        {
            var handle =  Addressables.LoadAssetAsync<T>(reference);
            
            handle.WaitForCompletion();
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {reference}");
                return null;
            }
        }
        
        
        public static GameObject LoadPrefab(AssetReference reference)
        {
            var handle =  Addressables.LoadAssetAsync<GameObject>(reference);
            
            handle.WaitForCompletion();
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {reference}");
                return null;
            }
        }

        public static async UniTask<T> LoadPrefabAsync<T>(string addressableName) where T : MonoBehaviour
        {
            var handle = Addressables.LoadAssetAsync<T>(addressableName);
            
            await handle.Task;
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {addressableName}");
                return null;
            }
        }

        public static async UniTask<GameObject> LoadPrefabAsync(string addressableName)
        {
            var handle = Addressables.LoadAssetAsync<GameObject>(addressableName);
            
            await handle.Task;
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {addressableName}");
                return null;
            }
        }
        
        public static async UniTask<T> LoadPrefabAsync<T>(AssetReference reference) where T : MonoBehaviour
        {
            var handle = Addressables.LoadAssetAsync<T>(reference);
            
            await handle.Task;
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {reference}");
                return null;
            }
        }

        public static async UniTask<GameObject> LoadPrefabAsync(AssetReference reference)
        {
            var handle = Addressables.LoadAssetAsync<GameObject>(reference);
            
            await handle.Task;
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                return handle.Result;
            }
            else
            {
                Debug.LogError($"Failed to load prefab at {reference}");
                return null;
            }
        }

        public static void ReleasePrefab<T>(T prefab) where T : MonoBehaviour
        {
            Addressables.Release(prefab);
        }
    }
}