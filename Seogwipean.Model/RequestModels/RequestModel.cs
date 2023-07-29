namespace Seogwipean.Model.RequestModels
{
    public class RequestModel
    {
        public string Source { get; set; }
        public string Target { get; set; }
        public string Text { get; set; }
    }

    public class RequestModel<T> : RequestModel
    {
        public T Data { get; set; }
    }
}
