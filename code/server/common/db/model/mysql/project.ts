export default interface IServer_DB_Model_Project {
    id :bigint,
  key :string,
  name :string,
  created_time :number,
  modified_time :number,
  image :bigint,
  created_by :bigint ,
  description :string,
}
export const Table_Project="project"