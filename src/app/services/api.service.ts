import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'https://api.zapp.justabit.xyz';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }

  // Species
  getSpecies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/species`, { headers: this.getAuthHeaders() });
  }

  saveSpecies(specie: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/species`, specie, { headers: this.getAuthHeaders() });
  }

  // Plants
  getPlants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/plants`, { headers: this.getAuthHeaders() });
  }

  savePlant(plant: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/plants`, plant, { headers: this.getAuthHeaders() });
  }

  // Tasks
  getTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tasks`, { headers: this.getAuthHeaders() });
  }

  updateTask(task: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks`, task, { headers: this.getAuthHeaders() });
  }
}
