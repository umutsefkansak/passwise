package com.umut.passwise.service.security;


import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.repository.AdminRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthenticationService {
    private final AdminRepository adminRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            AdminRepository adminRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin signup(AdminRequestDto input) {
        Admin user = new Admin()
                .setName(input.getName())
                .setSurname(input.getSurname())
                .setUsername(input.getUsername())
                .setPassword(passwordEncoder.encode(input.getPassword()));

        return adminRepository.save(user);
    }

    public Admin authenticate(AdminRequestDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()
                )
        );

        return adminRepository.findByUsername(input.getUsername())
                .orElseThrow();
    }
}