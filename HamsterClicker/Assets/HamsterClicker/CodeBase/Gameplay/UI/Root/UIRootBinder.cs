using HamsterClicker.CodeBase.Gameplay.UI.Factories;
using ObservableCollections;
using R3;
using UnityEngine;
using Zenject;

namespace HamsterClicker.CodeBase.Gameplay.UI.Root
{
    public class UIRootBinder : MonoBehaviour
    {
        private WindowsFactory _windowsFactory;
        
        private UIRootViewModel _viewModel;
        
        private readonly CompositeDisposable _subscriptions = new();
        
        [Inject]
        public void Construct(WindowsFactory windowsFactory)
        {
            _windowsFactory = windowsFactory;
        }
        
        public void Bind(UIRootViewModel viewModel)
        {
            _viewModel = viewModel;
            
            foreach (var openedWindow in _viewModel.OpenedWindows)
            {
                _windowsFactory.OpenWindow(openedWindow, transform);
            }
            

            _subscriptions.Add(_viewModel.OpenedWindows.ObserveAdd().Subscribe(e =>
            {
                _windowsFactory.OpenWindow(e.Value, transform);
            }));

            _subscriptions.Add(_viewModel.OpenedWindows.ObserveRemove().Subscribe(e =>
            {
                _windowsFactory.CloseWindow(e.Value);
            }));
            
            OnBind(_viewModel);
        }

        public void AttachScreenBinder<TViewModel>(Binder<TViewModel> binder) where TViewModel : ViewModel
        {
			_subscriptions.Add(_viewModel.OpenedScreen.Subscribe(viewModel =>
			{
				binder.Bind((TViewModel)viewModel);
			}));
		}

        private void OnBind(UIRootViewModel viewModel)
        {
            
        }

        private void OnDestroy()
        {
            _subscriptions.Dispose();
        }
    }
}