using Seogwipean.Service.Interface;
using System;
using Microsoft.AspNetCore.Http;
using Seogwipean.Util;

namespace Seogwipean.Service.Kakao
{
    public class KakaoService : IKakaoService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private ISession _session => _httpContextAccessor.HttpContext.Session;

        private readonly IHttpCallService _httpCallService;
        public KakaoService(IHttpCallService httpCallService, IHttpContextAccessor httpContextAccessor)
        {
            _httpCallService = httpCallService;
            _httpContextAccessor = httpContextAccessor;
        }

        private string REST_API_KEY = "55982beac0a9ebaf0a86fe0312dca1d7";

        private string REDIRECT_URI = "https://localhost:44376/Kakao/login-callback";

        private string AUTHORIZE_URI = "https://kauth.kakao.com/oauth/authorize";

        public string TOKEN_URI = "https://kauth.kakao.com/oauth/token";

        private string CLIENT_SECRET = "UmcxSBI0HpxbSQD1FM3C0ig4rLKsVbEb";

        private string KAKAO_API_HOST = "https://kapi.kakao.com";


        public string Login()
        {
            return Login("");
        }

        public string Login(string scope)
        {
            String uri = AUTHORIZE_URI + "?redirect_uri=" + REDIRECT_URI + "&response_type=code&client_id=" + REST_API_KEY;
            if (!String.IsNullOrEmpty(scope)) uri += "&scope=" + scope;
            return uri;
        }

        public string LoginCallback(string code)
        {
            string param = "grant_type=authorization_code&client_id=" + REST_API_KEY + "&redirect_uri=" + Uri.EscapeDataString(REDIRECT_URI) + "&client_secret=" + CLIENT_SECRET + "&code=" + code;
            string rtn = _httpCallService.Call(Const.POST, TOKEN_URI, Const.EMPTY, param);

            _session.SetString("token", Trans.token(rtn));
            return "/";
        }

        public string GetProfile()
        {
            string uri = KAKAO_API_HOST + "/v2/user/me";
            return _httpCallService.CallwithToken(Const.GET, uri, _session.GetString("token"));
        }

        public string GetFriends()
        {
            string uri = KAKAO_API_HOST + "/v1/api/talk/friends";
            return _httpCallService.CallwithToken(Const.GET, uri, _session.GetString("token"));
        }

        public string Message()
        {
            string uri = KAKAO_API_HOST + "/v2/api/talk/memo/default/send";
            return _httpCallService.CallwithToken(Const.POST, uri, _session.GetString("token"), Trans.default_msg_param);
        }

    }
}
