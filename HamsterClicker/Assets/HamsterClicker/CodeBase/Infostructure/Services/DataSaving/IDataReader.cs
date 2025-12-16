using HamsterClicker.CodeBase.Infostructure.JsonData;

namespace HamsterClicker.CodeBase.Infostructure.Services.DataSaving
{
    public interface IDataReader
    {
        void Load(GameData data);
    }
}