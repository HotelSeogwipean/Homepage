using System;
using System.IO;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.ResultModels;
using Seogwipean.Util;

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

        public class RequestModel
        {
            public string Source { get; set; }
            public string Target { get; set; }
            public string Text { get; set; }
            public string Client { get; set; }
            public string Secret { get; set; }
        }

        [HttpGet("/Test/Papago")]
        [HttpPost("/Test/Papago")]
        public IActionResult GetPapago(RequestModel vm)
        {
            string _client = vm.Client;
            string _secret = vm.Secret;
            string _source = vm.Source;
            string _target = vm.Target;
            string _query = vm.Text;

            Console.WriteLine("1: Client " + _client + " Secret " + _secret + " Source " + _source + " Target " + _target + " Text " + _query);
            if (_source == "" || _source == null)
            {
                vm.Source = "ko";
                vm.Target = "en";
                vm.Text = "지금 진행중인 내용은 테스트를 위한 의미없는 번역입니다.";
                // vm.Client = "xTvSfa4FtosiAGIJy7XE";
                // vm.Secret = "qMuICLBMLp";
                vm.Client = "Y9EjKoi9iVLwIRmq0C3d";
                vm.Secret = "gEYBMfFMP5";
            }

                //return Json(new LongResult {
                //    Result = Common.Fail,
                //    Reason = "REQUESET 내용이 없습니다."
                //});


            string url = "https://openapi.naver.com/v1/papago/n2mt";
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Headers.Add("X-Naver-Client-Id", _client);
            request.Headers.Add("X-Naver-Client-Secret", _secret);
            request.Method = "POST";

            byte[] byteDataParams = Encoding.UTF8.GetBytes("source=" + _source + "&target=" + _target + "&text=" + _query);
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = byteDataParams.Length;

            Console.WriteLine("2: Client " + _client + " Secret " + _secret + " Source " + _source + " Target " + _target + " Text " + _query);


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