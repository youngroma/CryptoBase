using UnityEngine;

namespace HamsterClicker.CodeBase.Gameplay.UI.Root
{
    public abstract class Binder<T> : MonoBehaviour where T : ViewModel
    {
        protected T ViewModel;
        
        public void Bind(T viewModel)
        {
            ViewModel = viewModel;
            OnBind(viewModel);
        }
        
        protected virtual void OnBind(T viewModel){}
    }
}