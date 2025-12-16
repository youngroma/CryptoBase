namespace HamsterClicker.CodeBase.Infostructure.GameBase.StateMachine
{
    public interface IState : IExitableState
    {
        void Enter();
    }
}