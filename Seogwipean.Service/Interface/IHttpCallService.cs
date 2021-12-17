using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface IHttpCallService
    {
        String Call(String method, String reqURL, String header, string param);
        String CallwithToken(String method, String reqURL, String access_Token);
        String CallwithToken(String method, String reqURL, String access_Token, string param);
    }
}
