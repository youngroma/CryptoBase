using HamsterClicker.CodeBase.Infostructure.JsonData;

namespace HamsterClicker.CodeBase.Infostructure.Services.DataSaving
{
    public interface IDataWriter : IDataReader
    {
        void Save(ref GameData data);
    }
}