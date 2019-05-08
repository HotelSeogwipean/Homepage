namespace Seogwipean.Model.ResultModels
{
    public class LongResult
    {
        public long Result { get; set; }
        public string Reason { get; set; }
    }

    public class LongResult<T> : LongResult
    {
        public T Data { get; set; }
    }
}
