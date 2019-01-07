using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;

namespace Seogwipean.Service
{
    /// <summary>
    /// 뷰 페이지를 HTML 문자열로 반환하는 인터페이스
    /// </summary>
    public interface IViewRenderService
    {
        Task<string> RenderToStringAsync(string viewName, object model);
    }

    /// <summary>
    /// 뷰 페이지를 HTML 문자열로 반환하는 서비스 클래스
    /// </summary>
    public class ViewRenderService : IViewRenderService
    {
        private readonly IRazorViewEngine razorViewEngine;
        private readonly ITempDataProvider tempDataProvider;
        private readonly IServiceProvider serviceProvider;
        private readonly string projectRootFolder;

        public ViewRenderService(IRazorViewEngine razorViewEngine,
                                 ITempDataProvider tempDataProvider,
                                 IServiceProvider serviceProvider,
                                 IHostingEnvironment env)
        {
            this.razorViewEngine = razorViewEngine;
            this.tempDataProvider = tempDataProvider;
            this.serviceProvider = serviceProvider;

            var projectRootFolderName = env.IsDevelopment() ? "betaSeogwipean" : "Seogwipean";
            this.projectRootFolder = env.ContentRootPath.Substring(0,
                env.ContentRootPath.LastIndexOf($@"\{projectRootFolderName}\", StringComparison.Ordinal) + $@"\{projectRootFolderName}\".Length);
        }

        /// <summary>
        /// 뷰와 모델로 HTML 을 랜더링한 문자열을 반환
        /// </summary>
        /// <param name="viewName">뷰 이름</param>
        /// <param name="model">데이터 모델</param>
        /// <returns></returns>
        /// <exception cref="ArgumentNullException"></exception>
        public async Task<string> RenderToStringAsync(string viewName, object model)
        {
            var httpContext = new DefaultHttpContext { RequestServices = serviceProvider };
            var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());

            using (var sw = new StringWriter())
            {
                //var viewResult = razorViewEngine.FindView(actionContext, viewName, false);
                var viewResult = razorViewEngine.GetView(this.projectRootFolder, $"/Views/{viewName}.cshtml", false);
                //var viewResult2 = razorViewEngine.GetView("", $"/Views/{viewName}.cshtml", false);

                if (viewResult.View == null)
                {
                    throw new ArgumentNullException($"{viewName} does not match any available view");
                }

                var viewDictionary = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                {
                    Model = model
                };
                var viewContext = new ViewContext(
                    actionContext,
                    viewResult.View,
                    viewDictionary,
                    new TempDataDictionary(actionContext.HttpContext, tempDataProvider),
                    sw,
                    new HtmlHelperOptions()
                );

                await viewResult.View.RenderAsync(viewContext);
                return sw.ToString();
            }
        }
    }
}
