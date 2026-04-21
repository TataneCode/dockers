namespace SampleApi.Services;

public interface IEntityService<TRequest, TResponse>
{
    Task<List<TResponse>> GetAllAsync();
    Task<TResponse?> GetByIdAsync(string id);
    Task<TResponse> CreateAsync(TRequest request);
    Task<TResponse?> UpdateAsync(string id, TRequest request);
    Task<bool> DeleteAsync(string id);
}
