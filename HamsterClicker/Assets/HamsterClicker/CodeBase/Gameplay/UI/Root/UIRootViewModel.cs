using System;
using System.Collections.Generic;
using HamsterClicker.CodeBase.Gameplay.UI.Windows;
using ObservableCollections;
using R3;

namespace HamsterClicker.CodeBase.Gameplay.UI.Root
{
    public class UIRootViewModel : IDisposable
    {
        public ReadOnlyReactiveProperty<ViewModel> OpenedScreen => _openedScreen;
        
        public IObservableCollection<WindowViewModel> OpenedWindows => _openedWindows;
        
        private readonly ReactiveProperty<ViewModel> _openedScreen = new();
        private readonly ObservableList<WindowViewModel> _openedWindows = new();
        private readonly Dictionary<ViewModel, IDisposable> _viewModelSubscriptions = new();

        public void Dispose()
        {
            CloseAllWindows();
            _openedScreen?.Dispose();
        }
        
        public void OpenScreen(ViewModel screenViewModel)
        {
            _openedScreen.Value?.Dispose();
            _openedScreen.Value = screenViewModel;
        }

        public void OpenWindow(WindowViewModel window)
        {
            if (_openedWindows.Contains(window))
            {
                return;
            }

            using CompositeDisposable subscriptions = new CompositeDisposable();
            
            subscriptions.Add(window.CloseRequested.Subscribe(_ => CloseWindow(window)));

            _viewModelSubscriptions.Add(window, subscriptions);
            _openedWindows.Add(window);

        }
        public void CloseWindow(WindowViewModel window)
        {
            if (_openedWindows.Contains(window))
            {
                window.Dispose();
                _openedWindows.Remove(window);

                var viewModelSubscription = _viewModelSubscriptions[window];
                viewModelSubscription?.Dispose();
                _viewModelSubscriptions.Remove(window);
            }
        }
        public void CloseAllWindows()
        {
            foreach (var window in _openedWindows)
            {
                CloseWindow(window);
            }
        }
    }
}