using HamsterClicker.CodeBase.Gameplay.UI.Root;
using Zenject;
using Object = UnityEngine.Object;
using PrefabProvider = HamsterClicker.CodeBase.Infostructure.Services.PrefabProviding.PrefabProvider;

namespace HamsterClicker.CodeBase.Gameplay.UI.Factories
{
    public class UIRootFactory
    {
        private UIRootBinder _uiRootBinder;
        private UIRootViewModel _uiRootViewModel;

        private DiContainer _container;

        public UIRootBinder UIRootBinder => _uiRootBinder;
        public UIRootViewModel UIRootViewModel => _uiRootViewModel;

		public UIRootFactory(DiContainer container, UIRootViewModel uiRootViewModel)
        {
            _container = container;
            
            _uiRootViewModel = uiRootViewModel;
        }

        public void CreateUIRoot(string uiRootAddressableName)
        {
            DestroyUIRoot();
            
            var prefab = PrefabProvider.LoadPrefab(uiRootAddressableName);
            
            var instance = _container.InstantiatePrefab(prefab);

             _uiRootBinder = instance.GetComponent<UIRootBinder>();
            
            _uiRootBinder.Bind(_uiRootViewModel);
        }

        public void DestroyUIRoot()
        {
            if (_uiRootBinder != null)
            {
                Object.Destroy(_uiRootBinder.gameObject);
                _uiRootViewModel.Dispose();
            }
        }
    }
}