using HamsterClicker.CodeBase.Gameplay.UI.Root;
using R3;
using UnityEngine;

namespace HamsterClicker.CodeBase.Gameplay.UI.Windows
{   
    [RequireComponent(typeof(Canvas))]
    public class WindowBinder : Binder<WindowViewModel>
    {
        private Canvas _canvas;
        
        protected CompositeDisposable _disposables = new CompositeDisposable();
        protected override void OnBind(WindowViewModel viewModel)
        {
            base.OnBind(viewModel);
            
        }
        
        public void Close()
        {
            Destroy(gameObject);
        }

        protected virtual void OnAwake()
        {
            _canvas = GetComponent<Canvas>();
        }
        protected virtual void OnEnabling()
        {
            
        }
        protected virtual void OnDisabling()
        {
            
        }

        protected virtual void OnDestroying()
        {
            _disposables.Dispose();
        }
		private void Awake() => OnAwake();

        private void OnEnable() => OnEnabling();


        private void OnDisable() => OnDisabling();

        private void OnDestroy() => OnDestroying();

    }
}