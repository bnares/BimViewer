using BIMViewer.DTO;
using BIMViewer.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BIMViewer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModelController : ControllerBase
    {
        private readonly BimContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ModelController(BimContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("allProjects")]
        public async Task<ActionResult<List<Model>>> GetAllProjects()
        {
            var projects = await _context.Models.Select(x => new Model()
            {
                Id = x.Id,
                Name = x.Name,
                Description= x.Description,
                Status= x.Status,
                File= x.File,
                FileName= x.FileName,
                FileSrc = String.Format("{0}://{1}{2}/Fragments/{3}", Request.Scheme,Request.Host, Request.PathBase,x.FileName),
                ModelProperties= x.ModelProperties,

            }).ToListAsync();
            return Ok(projects);
        }

        [HttpGet("getProject/{id}", Name ="GetProject")]
        public async Task<ActionResult<Model>> GetProjectById(int id)
        {
            var project = await _context.Models.Select(x => new Model()
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Status = x.Status,
                File = x.File,
                FileName = x.FileName,
                FileSrc = String.Format("{0}://{1}{2}/Fragments/{3}", Request.Scheme, Request.Host, Request.PathBase, x.FileName),
                ModelProperties = x.ModelProperties,

            }).SingleOrDefaultAsync();
            if (project == null) return NotFound(new ProblemDetails() { Title = "Cant find such project" });
            return Ok(project);
        }

        [HttpPost("newProject")]
        public async Task<ActionResult<Model>> CreateProject( [FromForm] ModelDto dto)
        {
            if (dto.Name.IsNullOrEmpty()) return BadRequest(new ProblemDetails() { Title = "Add Name" });
            if (dto.Description.IsNullOrEmpty()) return BadRequest(new ProblemDetails() { Title = "Add Description" });
            if (dto.Status.IsNullOrEmpty()) return BadRequest(new ProblemDetails() { Title = "Add Description" });
            if (dto.File == null || dto.File.Length == 0) return BadRequest(new ProblemDetails() { Title = "Add File" });
            if (dto.ModelProperties.IsNullOrEmpty()) return BadRequest(new ProblemDetails() { Title = "Worng file, cant get properties of model" });

            var model = new Model() {
                Name = dto.Name,
                Description = dto.Description,
                Status = dto.Status,
                File = dto.File,
                FileSrc = dto.FileSrc,
                FileName = await SaveFile(dto.File, "Fragments"),
                ModelProperties = dto.ModelProperties,

            };

            if (_context.Models.FirstOrDefault(x => x.Name == dto.Name) != null) return BadRequest(new ProblemDetails() { Title = "Project already exist" });
            await _context.Models.AddAsync(model);
            var result = await _context.SaveChangesAsync();
            if (result > 0) return CreatedAtRoute("GetProject", new { Id = model.Id }, model);
            return BadRequest(new ProblemDetails() { Title = "Cant save Project, sth went wrong" });
        }

        [HttpGet("Fragments/{fileName}")]
        public async Task<IActionResult> GetFileFromServer(string fileName)
        {
            var filePath = Path.Combine("Fragments", fileName);
            if (System.IO.File.Exists(filePath))
            {
                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                return File(fileStream, "application/octet-stream", fileName);
               
            }
            else
            {
                return NotFound(new ProblemDetails() { Title="Cant find file with project"});
            }

        }

        [NonAction]
        private async Task<string> SaveFile(IFormFile file, string folderName)
        {
            string fileName = new string(Path.GetFileNameWithoutExtension(file.FileName).Take(10).ToArray()).Replace(" ", "");
            fileName = fileName + DateTime.Now.ToString("yymmssfff") + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, folderName, fileName);
            using(var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }
            return fileName; ;
        }
    }
}
