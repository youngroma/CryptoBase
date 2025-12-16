using HamsterClicker.CodeBase.Infostructure.IDs;
using HamsterClicker.CodeBase.Infostructure.Services;

namespace HamsterClicker.CodeBase.Infostructure.GameBase.StateMachine.GameStates
{
    public class BootstrapState : IState
    {
        private GameStateMachine _stateMachine;
        private SceneLoader _sceneLoader;
        
        public BootstrapState(SceneLoader sceneLoader, GameStateMachine stateMachine)
        {
            _sceneLoader = sceneLoader;
            _stateMachine = stateMachine;
        }
        public async void Enter()
        {
            await _sceneLoader.LoadSceneAsync((int)SceneIDs.Game, OnSceneLoaded);
		}

        private void OnSceneLoaded()
        {
           
            
        }

        public void Exit()
        {
            
        }
    }
}