using HamsterClicker.CodeBase.Gameplay.UI.Root;
using R3;

namespace HamsterClicker.CodeBase.Gameplay.UI.Windows
{
    public abstract class WindowViewModel : ViewModel
    {
		public Observable<ViewModel> CloseRequested => _closeRequested;
        
		private readonly Subject<ViewModel> _closeRequested = new();
        
        public abstract string Id { get; }
        
        public override void Dispose()
        {
            base.Dispose();
            _closeRequested?.Dispose();
        }
    }
}