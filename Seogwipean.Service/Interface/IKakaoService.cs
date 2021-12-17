using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface IKakaoService
    {
        String Login();
        String Login(String scope);
        String LoginCallback(String code);
        String GetProfile();
        String GetFriends();
        String Message();
    }
}
