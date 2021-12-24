using Seogwipean.Service.Interface;
using System;
using Microsoft.AspNetCore.Http;
using Seogwipean.Util;
using Newtonsoft.Json;
using Seogwipean.Model.KakaoViewModels;

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
        private string AUTHORIZE_URI = "https://kauth.kakao.com/oauth/authorize";
        public string TOKEN_URI = "https://kauth.kakao.com/oauth/token";
        private string CLIENT_SECRET = "UmcxSBI0HpxbSQD1FM3C0ig4rLKsVbEb";
        private string KAKAO_API_HOST = "https://kapi.kakao.com";

        public string Login(string url)
        {
            return Login(url, "");
        }

        public string Login(string url, string scope)
        {
            string uri = AUTHORIZE_URI + "?redirect_uri=" + "https://" + url + "/Kakao/login-callback" + "&response_type=code&client_id=" + REST_API_KEY;
            if (!string.IsNullOrEmpty(scope)) uri += "&scope=" + scope;
            return uri;
        }

        public string LoginCallback(string url, string code)
        {
            string param = "grant_type=authorization_code&client_id=" + REST_API_KEY + "&redirect_uri=" + Uri.EscapeDataString("https://" + url + "/Kakao/login-callback") + "&client_secret=" + CLIENT_SECRET + "&code=" + code;
            string rtn = _httpCallService.Call(Const.POST, TOKEN_URI, Const.EMPTY, param);
            _session.SetString("token", Trans.token(rtn));
            string uri = KAKAO_API_HOST + "/v2/user/me";
            var _user = _httpCallService.CallwithToken(Const.GET, uri, _session.GetString("token"));
            KakaoViewModel __user = JsonConvert.DeserializeObject<KakaoViewModel>(_user);
            _session.SetString("id", __user.Id.ToString());
            if (__user.Kakao_account.Phone_number_needs_agreement)
            {
                _session.SetString("phone", __user.Kakao_account.Phone_number);
            }
            _session.SetString("login", "true");
            return "/coupon/idx";
        }

        public KakaoViewModel GetProfileSave()
        {
            string uri = KAKAO_API_HOST + "/v2/user/me";
            var _user = _httpCallService.CallwithToken(Const.GET, uri, _session.GetString("token"));
            if(_user == null || _user == "null")
            {
                return null;
            }
            KakaoViewModel __user = JsonConvert.DeserializeObject<KakaoViewModel>(_user);
            return __user;
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
