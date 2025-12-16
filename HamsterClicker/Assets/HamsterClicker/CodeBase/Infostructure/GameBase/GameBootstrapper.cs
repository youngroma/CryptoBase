using HamsterClicker.CodeBase.Infostructure.GameBase.StateMachine;
using HamsterClicker.CodeBase.Infostructure.GameBase.StateMachine.GameStates;
using HamsterClicker.CodeBase.Infostructure.Services;
using UnityEngine;
using Zenject;
using PrefabProvider = HamsterClicker.CodeBase.Infostructure.Services.PrefabProviding.PrefabProvider;

namespace HamsterClicker.CodeBase.Infostructure.GameBase
{
    public class GameBootstrapper : MonoBehaviour
    {
        private GameStateMachine _stateMachine;
 
		private SceneLoader _sceneLoader;
        private DiContainer _diContainer;

        [Inject]
        public void Construct(GameStateMachine stateMachine, SceneLoader sceneLoader, DiContainer diContainer)
        {
            _stateMachine = stateMachine;
			_sceneLoader = sceneLoader;
            _diContainer = diContainer;
        }

        private void Start()
        {
            var prefab = PrefabProvider.LoadPrefab("AutoSaveController");
            _diContainer.InstantiatePrefab(prefab);
            
            var achievementManagePrefab = PrefabProvider.LoadPrefab("AchievementManage");
            _diContainer.InstantiatePrefab(achievementManagePrefab);
            
            _stateMachine.AddState(new BootstrapState(_sceneLoader, _stateMachine));
            _stateMachine.Enter<BootstrapState>();
        }
    }
}