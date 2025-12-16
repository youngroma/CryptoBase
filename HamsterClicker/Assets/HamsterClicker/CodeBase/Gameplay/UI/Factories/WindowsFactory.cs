using System.Collections.Generic;
using HamsterClicker.CodeBase.Gameplay.UI.Windows;
using UnityEngine;
using Zenject;
using PrefabProvider = HamsterClicker.CodeBase.Infostructure.Services.PrefabProviding.PrefabProvider;

namespace HamsterClicker.CodeBase.Gameplay.UI.Factories
{
    public class WindowsFactory
    {
        private DiContainer _container;
        
        private Dictionary<WindowViewModel, WindowBinder> _windows = new();
        public Dictionary<WindowViewModel, WindowBinder> Windows => _windows;
        
        public WindowsFactory(DiContainer container)
        {
            _container = container;
        }
        public void OpenWindow(WindowViewModel window, Transform parent)
        {
            if (_windows.ContainsKey(window))
            {
                Debug.LogWarning($"Window {window.Id} is already open.");
                return;
            }
            
            var prefab = PrefabProvider.LoadPrefab(window.Id);
            
            var instance = _container.InstantiatePrefab(prefab, parent);
            
            var binder = instance.GetComponent<WindowBinder>();
            
            binder.Bind(window);

			_windows.Add(window, binder);

		}

        public void CloseWindow(WindowViewModel window)
        {
            if (!_windows.TryGetValue(window, out var binder))
            {
                Debug.LogWarning($"Window {window.Id} is not open, cannot close it.");
                return;
            }

            binder?.Close();
            _windows.Remove(window);
        }
    }
    
}