using System;
using System.IO;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.RequestModels;

namespace Seogwipean.Web.Controllers
{
    public class TestController : BaseController
    {
        private readonly ILogger _logger;

        public TestController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<TestController>();
        }

        [Route("/Test")]
        public IActionResult Index()
        {
            return View();
        }
        // hotelseogwipean 네이버 아이디, 번역테스트기
        // vm.Client = "xTvSfa4FtosiAGIJy7XE";
        // vm.Secret = "qMuICLBMLp";
        // sanghun0729 네이버 아이디, 음성 번역기
        // vm.Client = "3SbtHWJUDtveW6atp5oa";
        // vm.Secret = "Sg93ZrsIK3";
        // sanghun0729 네이버 아이디, 음성 번역기
        // vm.Client = "Y9EjKoi9iVLwIRmq0C3d";
        // vm.Secret = "gEYBMfFMP5";
        // sanghun0729 네이버 아이디, 음성 번역기
        // vm.Client = "qRI_iBDYZHUMEGJ9vcMe";
        // vm.Secret = "20_jR4NqRT";

        [HttpGet, HttpPost]
        [Route("/Test/Translate")]
        public IActionResult Translate(RequestModel vm)
        {
            string _client = vm.Client;
            string _secret = vm.Secret;
            string _source = vm.Source;
            string _target = vm.Target;
            string _query = vm.Text;

            Console.WriteLine("1: Client: " + _client + " Secret: " + _secret + " Source: " + _source + " Target: " + _target + " Text: " + _query);
            if (_source == "" || _source == null)
            {
                _source = "ko";
                _target = "en";
                _query = "테스트 번역";
                _client = "Y9EjKoi9iVLwIRmq0C3d";
                _secret = "gEYBMfFMP5";
            }

            string url = "https://openapi.naver.com/v1/papago/n2mt";
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Headers.Add("X-Naver-Client-Id", _client);
            request.Headers.Add("X-Naver-Client-Secret", _secret);
            request.Method = "POST";
            byte[] byteDataParams = Encoding.UTF8.GetBytes("source=" + _source + "&target=" + _target + "&text=" + _query);
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = byteDataParams.Length;
            Console.WriteLine("2: Client: " + _client + " Secret: " + _secret + " Source: " + _source + " Target: " + _target + " Text: " + _query);

            Stream st = request.GetRequestStream();
            st.Write(byteDataParams, 0, byteDataParams.Length);
            st.Close();

            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream stream = response.GetResponseStream();
            StreamReader reader = new StreamReader(stream, Encoding.UTF8);
            string text = reader.ReadToEnd();
            stream.Close();
            response.Close();
            reader.Close();
            // Console.WriteLine(text);

            return Json(text);
        }
    }
}