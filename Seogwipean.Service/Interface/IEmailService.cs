using Seogwipean.Model.EmailViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Seogwipean.Service.Interface
{
    public interface IEmailService
    {
        Task SendEmail(EmailViewModel vm);
    }
}