namespace HamsterClicker.CodeBase.Infostructure.GameBase.StateMachine
{
	public interface IPayloadState<T> :IExitableState
	{
		void Enter(T payload);
	}
}
