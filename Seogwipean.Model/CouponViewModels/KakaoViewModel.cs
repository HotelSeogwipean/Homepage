namespace Seogwipean.Model.CouponViewModels
{
    public class KakaoAuthViewModel
    {
        public string client_id { get; set; }
        public string redirect_uri { get; set; }
        public string response_type { get; set; }
        public string state { get; set; }
        public string prompt { get; set; }
    }
}
