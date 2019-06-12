using Seogwipean.Model.CommunityViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Data.Repositories.Interface
{
    public interface ICommunityRepository
    {
        LongResult<CommunityViewModel> AddWrite(CommunityViewModel vm);
    }
}
