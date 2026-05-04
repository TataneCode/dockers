using SampleApi.Domain.Models;

namespace SampleApi.Application.Services;

public interface IPowerService
{
    Task<IReadOnlyList<PowerModel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PowerModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<PowerModel> CreateAsync(PowerModel power, CancellationToken cancellationToken = default);
    Task<PowerModel?> UpdateAsync(string id, PowerModel power, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
