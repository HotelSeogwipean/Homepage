using Seogwipean.Model.CommunityViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface ICommunityService
    {
        LongResult<CommunityViewModel> AddWrite(CommunityViewModel vm);
    }
}