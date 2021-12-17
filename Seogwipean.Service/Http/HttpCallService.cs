using Seogwipean.Service.Interface;
using Seogwipean.Util;
using System;
using System.IO;
using System.Net;
using System.Text;


namespace Seogwipean.Service.Http
{
    public class HttpCallService : IHttpCallService
    {
        public string Call(string method, string reqURL, string header, string param)
        {
            var request = (HttpWebRequest)WebRequest.Create(reqURL);
            request.Headers["Authorization"] = header;
            HttpWebResponse response;
            var responseString = "";
            try
            {
                if (method.Equals(Const.GET))
                {
                    response = (HttpWebResponse)request.GetResponse();
                }
                else
                {
                    var data = Encoding.ASCII.GetBytes(param);
                    request.Method = Const.POST;
                    request.ContentType = "application/x-www-form-urlencoded";
                    request.ContentLength = data.Length;
                    using (var stream = request.GetRequestStream())
                    {
                        stream.Write(data, 0, data.Length);
                    }
                    response = (HttpWebResponse)request.GetResponse();
                }
                responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
            }
            catch (WebException e)
            {
                if (e.Status == WebExceptionStatus.ProtocolError)
                {
                    int code = (int)((HttpWebResponse)e.Response).StatusCode;
                    using (var reader = new StreamReader(e.Response.GetResponseStream()))
                    {
                        responseString = "[" + code + "]" + reader.ReadToEnd();
                    }
                }
            }

            return responseString;
        }

        public string CallwithToken(string method, string reqURL, string access_Token)
        {
            return CallwithToken(method, reqURL, access_Token, null);
        }
        public string CallwithToken(string method, string reqURL, string access_Token, string param)
        {
            string header = "Bearer " + access_Token;
            return Call(method, reqURL, header, param);
        }
    }
}
