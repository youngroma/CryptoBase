using System;
using System.Collections.Generic;
using UnityEngine;

namespace HamsterClicker.CodeBase.Infostructure.GameBase.StateMachine
{
    public class GameStateMachine
    {
        private IExitableState _currentState;
        private readonly Dictionary<Type, IExitableState> _states = new();

        public void AddState<TState>(TState gameState) where TState : class, IExitableState
        {
            if (_states.ContainsKey(typeof(TState)))
            {
                Debug.LogError("State machine already has: " + typeof(TState).FullName);
                return;
            }
            
            _states.Add(typeof(TState), gameState);
        }
		public void Enter<TState, TPayload>(TPayload payload) where TState : class, IPayloadState<TPayload> =>
			ChangeState<TState>().Enter(payload);
		public void Enter<TState>() where TState : class, IState =>
            ChangeState<TState>().Enter();
        
        private TState ChangeState<TState>() where TState : class, IExitableState
        {
            _currentState?.Exit();
            TState state = GetState<TState>();
            _currentState = state;
            return state;
        }
        
        private TState GetState<TState>() where TState : class, IExitableState =>
            _states[typeof(TState)] as TState;
    }
}