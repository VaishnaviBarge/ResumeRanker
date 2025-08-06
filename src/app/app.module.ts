import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './component/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DashboardLayoutComponent } from './component/dashboard-candidate/dashboard-layout/dashboard-layout/dashboard-layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ToastComponent } from './component/toster/toast/toast.component';
@NgModule({ declarations: [
        AppComponent,
        RegisterComponent,
        DashboardLayoutComponent,
        ToastComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
            preventDuplicates: true,
        })], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
