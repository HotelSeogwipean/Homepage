using Seogwipean.Model.KakaoViewModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface IKakaoService
    {
        string Login(string url);
        string Login(string url, string scope);
        string LoginCallback(string url, string code);
        string GetProfile();
        string GetFriends();
        string Message();
        KakaoViewModel GetProfileSave();
    }
}
